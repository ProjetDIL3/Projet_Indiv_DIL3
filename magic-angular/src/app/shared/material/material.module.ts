import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export const MATERIAL_MODULES = [
  MatCardModule,
  MatButtonModule,
  MatIconModule, 
  MatProgressSpinnerModule,
];

@NgModule({
  exports: MATERIAL_MODULES
})
export class MaterialModule {}