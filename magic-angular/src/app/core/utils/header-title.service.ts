import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderTitleService {
  private titleSubject = new BehaviorSubject<string>('');
  
  // Observable pour le titre de l'header
  public title$: Observable<string> = this.titleSubject.asObservable();
  
  setTitle(title: string): void {
    this.titleSubject.next(title);
  }
}