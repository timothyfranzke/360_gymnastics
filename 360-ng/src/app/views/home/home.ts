import { Component } from '@angular/core';
import { Hero } from '../../components/hero/hero';
import { WhyChooseUs } from "../../components/why-choose-us/why-choose-us";
import { FeaturedClasses } from '../../components/feature-classes/feature-classes';
import { Announcement } from '../../components/announcement/announcement';
import { HoursQuickLinks } from '../../components/hours-quick-links/hours-quick-links';
import { MainActivities } from '../../components/main-activities/main-activities';
import { SocialFeed } from '../../components/social-feed/social-feed';

@Component({
  selector: 'app-home',
  imports: [Hero, Announcement, HoursQuickLinks, WhyChooseUs, FeaturedClasses, MainActivities, SocialFeed],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

}
