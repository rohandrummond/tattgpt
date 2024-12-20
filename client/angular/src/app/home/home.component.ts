import { Component, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  constructor(private renderer: Renderer2, private el: ElementRef) {}

  ngOnInit() {

    const firstHeading: HTMLElement = this.el.nativeElement.querySelector('#first-heading');
    const firstHeadingContent: string = "Hello.";
    
    const secondHeading: HTMLElement = this.el.nativeElement.querySelector('#second-heading');
    const secondHeadingContent: string = "I'm TattGPT.";
  
    const typingSpeed = 250; 
    const deletingSpeed = 150; 
    const delayBetweenWords = 1000; 
    const delayBeforeSecondWord = 1000; 
    
    const typeWord = (element: HTMLElement, content: string, index: number, callback?: () => void) => {
      if (index < content.length) {
        element.textContent = content.substring(0, index + 1);
        setTimeout(() => typeWord(element, content, index + 1, callback), typingSpeed);
      } else if (callback) {
        setTimeout(callback, delayBetweenWords);
      }
    };

    const deleteWord = (element: HTMLElement, callback?: () => void) => {
      const content = element.textContent || "";
      if (content.length > 0) {
        element.textContent = content.substring(0, content.length - 1);
        setTimeout(() => deleteWord(element, callback), deletingSpeed);
      } else if (callback) {
        callback();
      }
    };
  
    const startAnimation = () => {
      firstHeading.style.display = "flex";
      typeWord(firstHeading, firstHeadingContent, 0, () => {
        deleteWord(firstHeading, () => {
          firstHeading.style.display = "none";
          setTimeout(() => {
            secondHeading.style.display = "flex"; 
            typeWord(secondHeading, secondHeadingContent, 0);
          }, delayBeforeSecondWord);
        });
      });
    };
  
    setTimeout(startAnimation, 1000);
  }
  
}