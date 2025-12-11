import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewHeader } from '../../components/view-header/view-header';
import { OpenGymService, OpenGymData, AgeGroup, OpenGymConfig } from '../../services/open-gym';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-open-gym',
  imports: [CommonModule, ViewHeader],
  templateUrl: './open-gym.html',
  styleUrl: './open-gym.scss'
})
export class OpenGym implements OnInit {
  private openGymService = inject(OpenGymService);
  
  openGymData$: Observable<OpenGymData> = this.openGymService.data$;
  
  ngOnInit(): void {
    this.openGymService.loadData();
  }

  getColorClasses(colorTheme: string): string {
    const colorMap: { [key: string]: string } = {
      'cyan': 'decorative-blur-cyan from-cyan-50 to-blue-50 text-cyan-600',
      'orange': 'decorative-blur-orange from-orange-50 to-yellow-50 text-orange-600',
      'purple': 'decorative-blur-purple from-purple-50 to-pink-50 text-purple-600',
      'pink': 'decorative-blur-pink from-pink-50 to-rose-50 text-pink-600',
      'green': 'decorative-blur-green from-green-50 to-emerald-50 text-green-600',
      'blue': 'decorative-blur-blue from-blue-50 to-indigo-50 text-blue-600'
    };
    
    return colorMap[colorTheme] || colorMap['cyan'];
  }
}
