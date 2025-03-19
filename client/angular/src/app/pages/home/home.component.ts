import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from '../../components/nav/nav.component';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    NavComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  ngOnInit() {

    const firstHeading: HTMLHeadingElement | null = document.querySelector('#first-heading');
    const firstHeadingContent: string = "HELLO.";
    
    const secondHeading: HTMLHeadingElement | null = document.querySelector('#second-heading');
    const secondHeadingContent: string = "I’M TATTGPT.";
  
    const typingSpeed = 250; 
    const deletingSpeed = 150; 
    const delay = 500; 
    
    const typeWord = (element: HTMLHeadingElement, content: string, index: number, callback?: () => void) => {
      if (index < content.length) {
        element.textContent = content.substring(0, index + 1);
        setTimeout(() => typeWord(element, content, index + 1, callback), typingSpeed);
      } else if (callback) {
        setTimeout(callback, delay);
      }
    };

    const deleteWord = (element: HTMLHeadingElement, callback?: () => void) => {
      const content = element.textContent || "";
      if (content.length > 0) {
        element.textContent = content.substring(0, content.length - 1);
        setTimeout(() => deleteWord(element, callback), deletingSpeed);
      } else if (callback) {
        callback();
      }
    };
  
    const startAnimation = () => {
      if (firstHeading && secondHeading) {
        firstHeading.style.display = "flex";
        typeWord(firstHeading, firstHeadingContent, 0, () => {
          deleteWord(firstHeading, () => {
            firstHeading.style.display = "none";
            setTimeout(() => {
              secondHeading.style.display = "flex"; 
              typeWord(secondHeading, secondHeadingContent, 0, () => { 
                const hiddenElements: NodeListOf<HTMLElement> = document.querySelectorAll(".transparent");
                hiddenElements.forEach(element => {
                  element.style.opacity = "1";
                })
              });
            }, delay);
          });
        });
      }
    };
  
    setTimeout(startAnimation, 1000);
    
  }
  
}