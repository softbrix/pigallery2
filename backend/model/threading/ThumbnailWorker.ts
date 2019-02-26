import {Metadata, Sharp} from 'sharp';
import {Dimensions, State} from 'gm';
import {Logger} from '../../Logger';
import {FfmpegCommand, FfprobeData} from 'fluent-ffmpeg';
import {ThumbnailProcessingLib} from '../../../common/config/private/IPrivateConfig';
import {FFmpegFactory} from '../FFmpegFactory';

export class ThumbnailWorker {

  private static imageRenderer: (input: RendererInput) => Promise<void> = null;
  private static videoRenderer: (input: RendererInput) => Promise<void> = null;
  private static rendererType: ThumbnailProcessingLib = null;

  public static render(input: RendererInput, renderer: ThumbnailProcessingLib): Promise<void> {
    if (input.type === ThumbnailSourceType.Image) {
      return this.renderFromImage(input, renderer);
    }
    return this.renderFromVideo(input);
  }

  public static renderFromImage(input: RendererInput, renderer: ThumbnailProcessingLib): Promise<void> {
    if (ThumbnailWorker.rendererType !== renderer) {
      ThumbnailWorker.imageRenderer = ImageRendererFactory.build(renderer);
      ThumbnailWorker.rendererType = renderer;
    }
    return ThumbnailWorker.imageRenderer(input);
  }


  public static renderFromVideo(input: RendererInput): Promise<void> {
    if (ThumbnailWorker.videoRenderer === null) {
      ThumbnailWorker.videoRenderer = VideoRendererFactory.build();
    }
    return ThumbnailWorker.videoRenderer(input);
  }

}

export enum ThumbnailSourceType {
  Image, Video
}

export interface RendererInput {
  type: ThumbnailSourceType;
  mediaPath: string;
  size: number;
  makeSquare: boolean;
  thPath: string;
  qualityPriority: boolean;
  cut?: {
    x: number,
    y: number,
    width: number,
    height: number
  };
}

export class VideoRendererFactory {
  public static build(): (input: RendererInput) => Promise<void> {
    const ffmpeg = FFmpegFactory.get();
    const path = require('path');
    return (input: RendererInput): Promise<void> => {
      return new Promise((resolve, reject) => {

        Logger.silly('[FFmpeg] rendering thumbnail: ' + input.mediaPath);

        ffmpeg(input.mediaPath).ffprobe((err: any, data: FfprobeData) => {
          if (!!err || data === null) {
            return reject('[FFmpeg] ' + err.toString());
          }
          /// console.log(data);
          let width = null;
          let height = null;
          for (let i = 0; i < data.streams.length; i++) {
            if (data.streams[i].width) {
              width = data.streams[i].width;
              height = data.streams[i].height;
              break;
            }
          }
          if (!width || !height) {
            return reject('[FFmpeg] Can not read video dimension');
          }
          const ratio = height / width;
          const command: FfmpegCommand = ffmpeg(input.mediaPath);
          const fileName = path.basename(input.thPath);
          const folder = path.dirname(input.thPath);
          let executedCmd = '';
          command
            .on('start', (cmd) => {
              executedCmd = cmd;
            })
            .on('end', () => {
              resolve();
            })
            .on('error', (e) => {
              reject('[FFmpeg] ' + e.toString() + ' executed: ' + executedCmd);
            })
            .outputOptions(['-qscale:v 4']);
          if (input.makeSquare === false) {
            const newWidth = Math.round(Math.sqrt((input.size * input.size) / ratio));
            command.takeScreenshots({
              timemarks: ['10%'], size: newWidth + 'x?', filename: fileName, folder: folder
            });


          } else {
            command.takeScreenshots({
              timemarks: ['10%'], size: input.size + 'x' + input.size, filename: fileName, folder: folder
            });
          }
        });
      });
    };
  }
}

export class ImageRendererFactory {

  public static build(renderer: ThumbnailProcessingLib): (input: RendererInput) => Promise<void> {
    switch (renderer) {
      case ThumbnailProcessingLib.Jimp:
        return ImageRendererFactory.Jimp();
      case ThumbnailProcessingLib.gm:
        return ImageRendererFactory.Gm();
      case ThumbnailProcessingLib.sharp:
        return ImageRendererFactory.Sharp();
    }
    throw new Error('unknown renderer');
  }

  public static Jimp() {
    const Jimp = require('jimp');
    return async (input: RendererInput): Promise<void> => {
      // generate thumbnail
      Logger.silly('[JimpThRenderer] rendering thumbnail:' + input.mediaPath);
      const image = await Jimp.read(input.mediaPath);
      /**
       * newWidth * newHeight = size*size
       * newHeight/newWidth = height/width
       *
       * newHeight = (height/width)*newWidth
       * newWidth * newWidth = (size*size) / (height/width)
       *
       * @type {number}
       */
      const ratio = image.bitmap.height / image.bitmap.width;
      const algo = input.qualityPriority === true ? Jimp.RESIZE_BEZIER : Jimp.RESIZE_NEAREST_NEIGHBOR;

      if (input.cut) {
        image.crop(
          input.cut.x,
          input.cut.y,
          input.cut.width,
          input.cut.height
        );
      }
      if (input.makeSquare === false) {
        const newWidth = Math.sqrt((input.size * input.size) / ratio);

        image.resize(newWidth, Jimp.AUTO, algo);
      } else {
        image.resize(input.size / Math.min(ratio, 1), Jimp.AUTO, algo);
        image.crop(0, 0, input.size, input.size);
      }
      image.quality(60);        // set JPEG quality

      await new Promise((resolve, reject) => {
        image.write(input.thPath, (err: Error | null) => { // save
          if (err) {
            return reject('[JimpThRenderer] ' + err.toString());
          }
          resolve();
        });
      });

    };
  }


  public static Sharp() {
    const sharp = require('sharp');
    sharp.cache(false);
    return async (input: RendererInput): Promise<void> => {
      Logger.silly('[SharpThRenderer] rendering thumbnail:' + input.mediaPath);
      const image: Sharp = sharp(input.mediaPath, {failOnError: false});
      const metadata: Metadata = await image.metadata();

      /**
       * newWidth * newHeight = size*size
       * newHeight/newWidth = height/width
       *
       * newHeight = (height/width)*newWidth
       * newWidth * newWidth = (size*size) / (height/width)
       *
       * @type {number}
       */
      const ratio = metadata.height / metadata.width;
      const kernel = input.qualityPriority === true ? sharp.kernel.lanczos3 : sharp.kernel.nearest;

      if (input.cut) {
        image.extract({
          top: input.cut.y,
          left: input.cut.x,
          width: input.cut.width,
          height: input.cut.height
        });
      }
      if (input.makeSquare === false) {
        const newWidth = Math.round(Math.sqrt((input.size * input.size) / ratio));
        image.resize(newWidth, null, {
          kernel: kernel
        });

      } else {
        image
          .resize(input.size, input.size, {
            kernel: kernel,
            position: sharp.gravity.centre,
            fit: 'cover'
          });
      }
      await image.jpeg().toFile(input.thPath);
    };
  }


  public static Gm() {
    const gm = require('gm');
    return (input: RendererInput): Promise<void> => {
      return new Promise((resolve, reject) => {
        Logger.silly('[GMThRenderer] rendering thumbnail:' + input.mediaPath);
        let image: State = gm(input.mediaPath);
        image.size((err, value: Dimensions) => {
          if (err) {
            return reject('[GMThRenderer] ' + err.toString());
          }

          /**
           * newWidth * newHeight = size*size
           * newHeight/newWidth = height/width
           *
           * newHeight = (height/width)*newWidth
           * newWidth * newWidth = (size*size) / (height/width)
           *
           * @type {number}
           */
          try {
            const ratio = value.height / value.width;
            const filter = input.qualityPriority === true ? 'Lanczos' : 'Point';
            image.filter(filter);

            if (input.makeSquare === false) {
              const newWidth = Math.round(Math.sqrt((input.size * input.size) / ratio));
              image = image.resize(newWidth);
            } else {
              image = image.resize(input.size, input.size)
                .crop(input.size, input.size);
            }
            image.write(input.thPath, (e) => {
              if (e) {
                return reject('[GMThRenderer] ' + e.toString());
              }
              return resolve();
            });
          } catch (err) {
            return reject('[GMThRenderer] ' + err.toString());
          }
        });
      });
    };
  }
}
