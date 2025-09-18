import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthRedirectService {
  private redirectSubject: BehaviorSubject<string> =
    new BehaviorSubject<string>('/');
  public redirectObservable: Observable<string> =
    this.redirectSubject.asObservable();
  setRedirectUrl(url: string): void {
    this.redirectSubject.next(url);
  }
}
