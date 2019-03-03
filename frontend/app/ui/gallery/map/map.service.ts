import {Injectable} from '@angular/core';
import {NetworkService} from '../../../model/network/network.service';
import {FileDTO} from '../../../../../common/entities/FileDTO';
import {Utils} from '../../../../../common/Utils';
import {Config} from '../../../../../common/config/public/Config';
import {ClientConfig} from '../../../../../common/config/public/ConfigClass';

@Injectable()
export class MapService {


  constructor(private networkService: NetworkService) {
  }


  public async getMapPath(file: FileDTO): Promise<MapPath[]> {
    const filePath = Utils.concatUrls(file.directory.path, file.directory.name, file.name);
    const gpx = await this.networkService.getXML('/gallery/content/' + filePath);
    const elements = gpx.getElementsByTagName('trkpt');
    const points: MapPath[] = [];
    for (let i = 0; i < elements.length; i++) {
      points.push({
        lat: parseFloat(elements[i].getAttribute('lat')),
        lng: parseFloat(elements[i].getAttribute('lon'))
      });
    }
    return points;
  }


  public get ShortAttributions(): string[] {
    const yaga = '<a href="https://yagajs.org" title="YAGA">YAGA</a>';
    const lf = '<a href="https://leaflet-ng2.yagajs.org" title="Leaflet in Angular2">leaflet-ng2</a>';
    const OSM = '<a href="https://www.openstreetmap.org/copyright">OSM</a>';
    const MB = '<a href="https://www.mapbox.com/">Mapbox</a>';


    if (Config.Client.Map.mapProvider === ClientConfig.MapProviders.OpenStreetMap) {
      return [yaga + ' | &copy; ' + OSM];
    }

    if (Config.Client.Map.mapProvider === ClientConfig.MapProviders.Mapbox) {
      return [yaga + ' | ' + OSM + ' | ' + MB];
    }
    return [yaga + ' | ' + lf];
  }

  public get Attributions(): string[] {
    const yagalf = '<a href="https://yagajs.org" title="YAGA">YAGA</a> | ' +
      '<a href="https://leaflet-ng2.yagajs.org" title="Leaflet in Angular2">leaflet-ng2</a>';
    const OSM = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
    const MB = '&copy; <a href="https://www.mapbox.com/">Mapbox</a>';

    if (Config.Client.Map.mapProvider === ClientConfig.MapProviders.OpenStreetMap) {
      return [yagalf + ' | ' + OSM];
    }

    if (Config.Client.Map.mapProvider === ClientConfig.MapProviders.Mapbox) {
      return [yagalf + ' | ' + OSM + ' | ' + MB];
    }
    return [yagalf];
  }

  public get MapLayer(): string {
    if (Config.Client.Map.mapProvider === ClientConfig.MapProviders.Custom) {
      return Config.Client.Map.tileUrl;
    }
    if (Config.Client.Map.mapProvider === ClientConfig.MapProviders.Mapbox) {
      return 'https://api.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token='
        + Config.Client.Map.mapboxAccessToken;
    }
    return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  }

}


export interface MapPath {
  lat: number;
  lng: number;
}
