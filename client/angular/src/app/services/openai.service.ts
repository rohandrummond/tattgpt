import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Idea } from '../interfaces/idea';
import { Ideas } from '../interfaces/ideas';

@Injectable({
  providedIn: 'root'
})

export class OpenAiService {

  private ideasSubject: BehaviorSubject<Idea[] | null> = new BehaviorSubject<Idea[] | null>(null);
  public ideasObservable: Observable<Idea[] | null> = this.ideasSubject.asObservable();

  constructor(private http: HttpClient) {}

  toSentenceCase = (str: string) => {
    return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
  }

  generateIdeas = (formData: any): Promise<boolean> => {
    this.ideasSubject.next(null);
    return new Promise((resolve, reject) => {
      this.http.post<Ideas>('https://localhost:7072/generate-ideas', formData).subscribe({
        next: (response) => {
          response.tattooIdeas.forEach((idea) => {
            idea.idea = this.toSentenceCase(idea.idea)
          });
          this.ideasSubject.next(response.tattooIdeas);
          resolve(true); 
        },
        error: (e) => {
          reject('Failed to generate ideas: ' + e.message);
        }
      });
    });
  }

  generateImage = (idea: Idea, sourcePage: string,): Promise<boolean | string> => {
    let base64String: string = '';
    return new Promise((resolve, reject) => {
      this.http.post<String>('https://localhost:7072/generate-image', idea).subscribe({
        next: (response) => {
          base64String = response.replace(/['"]+/g, '');
          if (sourcePage === 'results') {
            let updatedIdeas: Idea[] | null;
            if (this.ideasSubject.value) {
              updatedIdeas = this.ideasSubject.value.map((existingIdea) => {
                if (existingIdea.idea === idea.idea) {
                  return { ...existingIdea, image: base64String };
                } else {
                  return existingIdea
                }
              })
              this.ideasSubject.next(updatedIdeas);
            }
            resolve(true);
          } 
          if (sourcePage === 'my-ideas') {
            resolve(base64String);
          }
        },
        error: (e) => {
          reject('Failed to generate image: ' + e.message);
        }
      });
    });
  }

}