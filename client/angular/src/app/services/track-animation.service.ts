import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TrackAnimationService {
  private trackAnimationSubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  public trackAnimationObservable: Observable<boolean> =
    this.trackAnimationSubject.asObservable();
  trackAnimation(): void {
    this.trackAnimationSubject.next(true);
  }
}
