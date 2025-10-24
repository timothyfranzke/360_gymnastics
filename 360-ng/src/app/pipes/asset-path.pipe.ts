import { Pipe, PipeTransform } from '@angular/core';
import { AssetPathService } from '../services/asset-path.service';

@Pipe({
  name: 'assetPath',
  pure: true
})
export class AssetPathPipe implements PipeTransform {
  
  constructor(private assetPathService: AssetPathService) {}

  transform(path: string): string {
    if (!path) {
      return '';
    }
    
    return this.assetPathService.getAssetPath(path);
  }
}