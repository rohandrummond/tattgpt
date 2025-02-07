import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavedIdeasComponent } from './saved-ideas.component';

describe('SavedIdeasComponent', () => {
  let component: SavedIdeasComponent;
  let fixture: ComponentFixture<SavedIdeasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavedIdeasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SavedIdeasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
