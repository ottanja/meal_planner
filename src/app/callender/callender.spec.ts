import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Callender } from './callender';

describe('Callender', () => {
  let component: Callender;
  let fixture: ComponentFixture<Callender>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Callender]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Callender);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
