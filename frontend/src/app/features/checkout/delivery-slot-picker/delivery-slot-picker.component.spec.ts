import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { DeliverySlotPickerComponent } from './delivery-slot-picker.component';
import { DeliverySlot } from '../../../core/models/checkout.model';

@Component({
  imports: [DeliverySlotPickerComponent],
  template: `
    <app-delivery-slot-picker [slots]="slots()" (slotSelected)="onSlotSelected($event)" />
  `,
})
class TestHostComponent {
  slots = signal<DeliverySlot[]>([]);
  selectedSlot: DeliverySlot | null = null;

  onSlotSelected(slot: DeliverySlot): void {
    this.selectedSlot = slot;
  }
}

describe('DeliverySlotPickerComponent', () => {
  const mockSlots: DeliverySlot[] = [
    { id: 1, date: '2026-03-06', dayLabel: 'Today', startTime: '14:00', endTime: '16:00', price: 7.9 },
    { id: 2, date: '2026-03-06', dayLabel: 'Today', startTime: '18:00', endTime: '20:00', price: 5.9 },
    { id: 3, date: '2026-03-07', dayLabel: 'Tomorrow', startTime: '10:00', endTime: '12:00', price: 4.9 },
    { id: 4, date: '2026-03-07', dayLabel: 'Tomorrow', startTime: '14:00', endTime: '16:00', price: 4.9 },
  ];

  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  function setup(slots: DeliverySlot[] = mockSlots) {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    host.slots.set(slots);
    fixture.detectChanges();
    return { fixture, host };
  }

  it('should render the delivery slot picker', () => {
    setup();
    expect(fixture.nativeElement.querySelector('[data-testid="delivery-slot-picker"]')).toBeInstanceOf(
      HTMLElement,
    );
  });

  it('should group slots by dayLabel', () => {
    setup();

    const headings = fixture.nativeElement.querySelectorAll('h4');
    expect(headings.length).toBe(2);
    expect(headings[0].textContent).toContain('Today');
    expect(headings[1].textContent).toContain('Tomorrow');
  });

  it('should render all slot buttons', () => {
    setup();

    const buttons = fixture.nativeElement.querySelectorAll('button[role="radio"]');
    expect(buttons.length).toBe(4);
  });

  it('should display time range on slot buttons', () => {
    setup();

    const firstButton = fixture.nativeElement.querySelector('[data-testid="slot-1"]');
    expect(firstButton.textContent).toContain('14:00');
    expect(firstButton.textContent).toContain('16:00');
  });

  it('should display price on slot buttons', () => {
    setup();

    const firstButton = fixture.nativeElement.querySelector('[data-testid="slot-1"]');
    expect(firstButton.textContent).toContain('CHF');
    expect(firstButton.textContent).toContain('7.90');
  });

  it('should emit slotSelected when a slot is clicked', () => {
    const { host } = setup();

    const button = fixture.nativeElement.querySelector('[data-testid="slot-2"]') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    expect(host.selectedSlot).toEqual(mockSlots[1]);
  });

  it('should visually mark the selected slot with aria-checked', () => {
    setup();

    const button = fixture.nativeElement.querySelector('[data-testid="slot-1"]') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    expect(button.getAttribute('aria-checked')).toBe('true');

    const otherButton = fixture.nativeElement.querySelector('[data-testid="slot-2"]') as HTMLButtonElement;
    expect(otherButton.getAttribute('aria-checked')).toBe('false');
  });

  it('should change selection when a different slot is clicked', () => {
    const { host } = setup();

    // click first slot
    const btn1 = fixture.nativeElement.querySelector('[data-testid="slot-1"]') as HTMLButtonElement;
    btn1.click();
    fixture.detectChanges();
    expect(host.selectedSlot?.id).toBe(1);

    // click second slot
    const btn2 = fixture.nativeElement.querySelector('[data-testid="slot-2"]') as HTMLButtonElement;
    btn2.click();
    fixture.detectChanges();
    expect(host.selectedSlot?.id).toBe(2);

    // first should no longer be selected
    expect(btn1.getAttribute('aria-checked')).toBe('false');
    expect(btn2.getAttribute('aria-checked')).toBe('true');
  });

  it('should show "No delivery slots available" when slots are empty', () => {
    setup([]);

    const noSlots = fixture.nativeElement.querySelector('[data-testid="no-slots"]');
    expect(noSlots).toBeInstanceOf(HTMLElement);
    expect(noSlots.textContent).toContain('No delivery slots available');
  });

  // ── Keyboard navigation ─────────────────────────────────────────

  describe('keyboard navigation', () => {
    it('should select next slot on ArrowRight', () => {
      const { host } = setup();

      const btn1 = fixture.nativeElement.querySelector('[data-testid="slot-1"]') as HTMLButtonElement;
      btn1.click();
      fixture.detectChanges();

      btn1.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      fixture.detectChanges();

      // Should have moved to slot 2 (next in "Today" group)
      expect(host.selectedSlot?.id).toBe(2);
    });

    it('should select previous slot on ArrowLeft', () => {
      const { host } = setup();

      const btn2 = fixture.nativeElement.querySelector('[data-testid="slot-2"]') as HTMLButtonElement;
      btn2.click();
      fixture.detectChanges();

      btn2.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
      fixture.detectChanges();

      // Should have moved to slot 1 (previous in "Today" group)
      expect(host.selectedSlot?.id).toBe(1);
    });

    it('should wrap around on ArrowRight at last slot in group', () => {
      const { host } = setup();

      const btn2 = fixture.nativeElement.querySelector('[data-testid="slot-2"]') as HTMLButtonElement;
      btn2.click();
      fixture.detectChanges();

      btn2.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      fixture.detectChanges();

      // Should wrap to slot 1 (first in "Today" group)
      expect(host.selectedSlot?.id).toBe(1);
    });

    it('should select slot on Enter key', () => {
      const { host } = setup();

      const btn3 = fixture.nativeElement.querySelector('[data-testid="slot-3"]') as HTMLButtonElement;
      btn3.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      fixture.detectChanges();

      expect(host.selectedSlot?.id).toBe(3);
    });
  });
});
