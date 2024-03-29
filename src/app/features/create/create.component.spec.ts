import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CreateComponent } from './create.component';

// Event creation logic
function createNewEvent(eventName: string, bubbles = false, cancelable = false) {
    let evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(eventName, bubbles, cancelable, null);
    return evt;
  }

describe('CreateComponent', () => {
  let component: CreateComponent;
  let fixture: ComponentFixture<CreateComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateComponent ],
      imports: [FormsModule, ReactiveFormsModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update the value of the title field', () => {
    const input = fixture.nativeElement.querySelector('#title_create_input');
    const event = createNewEvent('input');
  
    input.value = 'The Red Potter';
    input.dispatchEvent(event);
    
    expect(fixture.componentInstance.illustrationTitleControl.value).toEqual('The Red Potter');
  });

  it('should update the value in the title control', () => {
    component.illustrationTitleControl.setValue('The Blue Potter');
  
    const input = fixture.nativeElement.querySelector('#title_create_input');
  
    expect(input.value).toBe('The Blue Potter');
  });
});
