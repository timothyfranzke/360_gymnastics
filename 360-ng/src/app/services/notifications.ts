import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Notifications {
  notifications = [{
    screen: "classes",
    id: "homeschool-classes",
    message: "THESE CLASSES HAVE BEEN MOVED UNDER THE LEVELS CLASS THEY ARE ASSOCIATED WITH. SEE NOW LEVEL 1 AND LEVEL 2, BEGINNER BOYS FOR HOMESCHOOL CLASSES."
  }]


  getNotification(screen: string, id: string) {
    return this.notifications.find(n => n.screen === screen && n.id === id);
  }
}
