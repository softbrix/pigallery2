import {Pipe, PipeTransform} from '@angular/core';
import {OrientationTypes} from 'ts-exif-parser';

/**
 * This pipe is used to fix thumbnail and media orientation based on their exif orientation tag
 */

@Pipe({name: 'fixOrientation'})
export class FixOrientationPipe implements PipeTransform {

  public static transform(imageSrc: string, orientation: OrientationTypes): Promise<string> {
    if (orientation === OrientationTypes.TOP_LEFT) {
      return Promise.resolve(imageSrc);
    }
    return new Promise((resolve) => {
      const img = new Image();

      // noinspection SpellCheckingInspection
      img.onload = () => {
        const width = img.width,
          height = img.height,
          canvas = document.createElement('canvas'),
          ctx = canvas.getContext('2d');

        // set proper canvas dimensions before transform & export
        if (OrientationTypes.BOTTOM_LEFT < orientation &&
          orientation <= OrientationTypes.LEFT_BOTTOM) {
          // noinspection JSSuspiciousNameCombination
          canvas.width = height;
          // noinspection JSSuspiciousNameCombination
          canvas.height = width;
        } else {
          canvas.width = width;
          canvas.height = height;
        }

        // transform context before drawing image

        // transform function parameters:
        // a	Horizontal scaling
        // b	Horizontal skewing
        // c	Vertical skewing
        // d	Vertical scaling
        // e	Horizontal moving
        // f	Vertical moving

        switch (orientation) {
          case OrientationTypes.TOP_RIGHT: // 2
            ctx.transform(-1, 0, 0, 1, width, 0);
            break;
          case OrientationTypes.BOTTOM_RIGHT: // 3
            ctx.transform(-1, 0, 0, -1, width, height);
            break;
          case OrientationTypes.BOTTOM_LEFT: // 4
            ctx.transform(1, 0, 0, -1, 0, height);
            break;
          case OrientationTypes.LEFT_TOP: // 5
            ctx.transform(0, 1, 1, 0, 0, 0);
            break;
          case OrientationTypes.RIGHT_TOP: // 6
            ctx.transform(0, 1, -1, 0, height, 0);
            break;
          case OrientationTypes.RIGHT_BOTTOM: // 7
            ctx.transform(0, -1, -1, 0, height, width);
            break;
          case OrientationTypes.LEFT_BOTTOM: // 8
            ctx.transform(0, -1, 1, 0, 0, width);
            break;
          default:
            break;
        }

        // draw image
        ctx.drawImage(img, 0, 0);

        // export base64
        resolve(canvas.toDataURL());
      };

      img.onerror = () => {
        resolve(imageSrc);
      };

      img.src = imageSrc;
    });
  }

  transform(imageSrc: string, orientation: OrientationTypes): Promise<string> {
    return FixOrientationPipe.transform(imageSrc, orientation);
  }
}
