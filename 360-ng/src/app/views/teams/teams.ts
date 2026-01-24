import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ViewHeader } from '../../components/view-header/view-header';
import { Team } from '../../interfaces/team';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, RouterLink, ViewHeader],
  templateUrl: './teams.html',
  styleUrls: ['./teams.scss']
})
export class Teams {
  teams: Team[] = [
    {
      id: 'girls',
      name: 'Girls Competitive Team',
      description: 'Our girls competitive program develops athletes through progressive skill training, focusing on strength, flexibility, and artistic excellence. Athletes compete at USAG sanctioned meets throughout the region.',
      ageRange: 'Ages 6-18',
      levels: ['Level 3', 'Level 4', 'Level 5', 'Level 6', 'Level 7', 'Xcel Bronze', 'Xcel Silver', 'Xcel Gold'],
      practiceSchedule: [
        { days: 'Monday, Wednesday, Friday', times: '4:00 PM - 7:00 PM', level: 'Levels 3-5' },
        { days: 'Tuesday, Thursday', times: '4:00 PM - 8:00 PM', level: 'Levels 6-7' },
        { days: 'Saturday', times: '9:00 AM - 12:00 PM', level: 'All Levels' }
      ],
      coaches: [
        { name: 'Coach Sarah', title: 'Head Coach - Girls Program' },
        { name: 'Coach Emily', title: 'Assistant Coach' }
      ],
      achievements: [
        'State Championship qualifiers',
        'Regional competition medalists',
        'Multiple athletes advancing to higher levels each year'
      ],
      requirements: [
        'Must complete team evaluation/tryout',
        'Commitment to practice schedule required',
        'Competition fees separate from tuition',
        'Team leotard and warm-ups required'
      ],
      color: 'orange'
    },
    {
      id: 'boys',
      name: 'Boys Competitive Team',
      description: 'Our boys program builds strength, discipline, and competitive spirit through training on all six Olympic apparatus. Athletes develop skills that translate to success both in and out of the gym.',
      ageRange: 'Ages 6-18',
      levels: ['Level 4', 'Level 5', 'Level 6', 'Level 7', 'Level 8'],
      practiceSchedule: [
        { days: 'Monday, Wednesday', times: '5:00 PM - 8:00 PM', level: 'All Levels' },
        { days: 'Friday', times: '4:00 PM - 7:00 PM', level: 'All Levels' },
        { days: 'Saturday', times: '10:00 AM - 1:00 PM', level: 'All Levels' }
      ],
      coaches: [
        { name: 'Coach Mike', title: 'Head Coach - Boys Program' },
        { name: 'Coach Jason', title: 'Assistant Coach' }
      ],
      achievements: [
        'State Championship competitors',
        'Regional meet placers',
        'Strong foundation for high school gymnastics'
      ],
      requirements: [
        'Must complete team evaluation/tryout',
        'Commitment to practice schedule required',
        'Competition fees separate from tuition',
        'Team uniform required'
      ],
      color: 'blue'
    }
  ];

  scrollToContact(): void {
    window.location.href = '/contact-us';
  }
}
