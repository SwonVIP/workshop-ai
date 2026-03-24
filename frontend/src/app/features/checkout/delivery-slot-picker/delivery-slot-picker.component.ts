import { Component, input, output, computed, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { DeliverySlot } from '../../../core/models/checkout.model';

interface SlotGroup {
  dayLabel: string;
  slots: DeliverySlot[];
}

@Component({
  selector: 'app-delivery-slot-picker',
  imports: [CurrencyPipe],
  template: `
    <section data-testid="delivery-slot-picker">
      <h3 class="text-lg font-semibold text-foreground mb-4">Delivery Time</h3>
      @for (group of groupedSlots(); track group.dayLabel) {
        <div class="mb-4">
          <h4 class="text-sm font-medium text-muted-foreground mb-2">{{ group.dayLabel }}</h4>
          <div
            class="grid grid-cols-2 sm:grid-cols-3 gap-2"
            role="radiogroup"
            [attr.aria-label]="'Delivery slots for ' + group.dayLabel"
          >
            @for (slot of group.slots; track slot.id; let i = $index) {
              <button
                type="button"
                role="radio"
                [attr.aria-checked]="selectedSlotId() === slot.id"
                [attr.data-testid]="'slot-' + slot.id"
                class="rounded-lg border p-3 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                [class]="
                  selectedSlotId() === slot.id
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border hover:border-muted-foreground/50'
                "
                (click)="selectSlot(slot)"
                (keydown)="onKeydown($event, group.slots, i)"
              >
                <span class="block text-sm font-medium text-foreground">
                  {{ slot.startTime }} - {{ slot.endTime }}
                </span>
                <span class="block text-xs text-muted-foreground mt-0.5">
                  {{ slot.price | currency: 'CHF' : 'symbol' : '1.2-2' }}
                </span>
              </button>
            }
          </div>
        </div>
      }
      @if (slots().length === 0) {
        <p class="text-sm text-muted-foreground" data-testid="no-slots">
          No delivery slots available.
        </p>
      }
    </section>
  `,
})
export class DeliverySlotPickerComponent {
  readonly slots = input.required<DeliverySlot[]>();
  readonly slotSelected = output<DeliverySlot>();

  readonly selectedSlotId = signal<number | null>(null);

  readonly groupedSlots = computed<SlotGroup[]>(() => {
    const slots = this.slots();
    const groupMap = new Map<string, DeliverySlot[]>();
    for (const slot of slots) {
      const existing = groupMap.get(slot.dayLabel) ?? [];
      existing.push(slot);
      groupMap.set(slot.dayLabel, existing);
    }
    return Array.from(groupMap.entries()).map(([dayLabel, daySlots]) => ({
      dayLabel,
      slots: daySlots,
    }));
  });

  selectSlot(slot: DeliverySlot): void {
    this.selectedSlotId.set(slot.id);
    this.slotSelected.emit(slot);
  }

  onKeydown(event: KeyboardEvent, groupSlots: DeliverySlot[], currentIndex: number): void {
    let newIndex: number | null = null;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      newIndex = (currentIndex + 1) % groupSlots.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      newIndex = (currentIndex - 1 + groupSlots.length) % groupSlots.length;
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectSlot(groupSlots[currentIndex]);
      return;
    }

    if (newIndex !== null) {
      this.selectSlot(groupSlots[newIndex]);
      const target = event.target as HTMLElement;
      const parent = target.parentElement;
      if (parent) {
        const buttons = parent.querySelectorAll<HTMLButtonElement>('button[role="radio"]');
        buttons[newIndex]?.focus();
      }
    }
  }
}
