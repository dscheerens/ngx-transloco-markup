import { Notification, Observable } from 'rxjs';
import { materialize } from 'rxjs/operators';

import { observeProperty } from './observe-property';

export function materializeStream<T>(stream: Observable<T>): { events: Notification<T>[]; close(): void } {
    const events: Notification<T>[] = [];

    const subscription = stream.pipe(materialize()).subscribe((event) => events.push(event));

    return { events, close: () => subscription.unsubscribe() };
}

describe('observeProperty function', () => {
    it('returns an observable that starts by emitting the current value of the property', () => {
        const object = { value: 'a' };

        const { events, close } = materializeStream(observeProperty(object, 'value'));

        try {
            expect(events.length).toBe(1);
            expect(events[0].kind).toBe('N');
            expect(events[0].value).toBe('a');
        } finally {
            close();
        }
    });

    it('returns an observable that emits every new value assigned to the property', () => {
        const object = { value: 'a' };

        const { events, close } = materializeStream(observeProperty(object, 'value'));

        try {
            expect(object.value).toBe('a');
            expect(events.length).toBe(1);
            expect(events[0].kind).toBe('N');
            expect(events[0].value).toBe('a');

            object.value = 'b';

            expect(object.value).toBe('b');
            expect(events.length).toBe(2);
            expect(events[1].kind).toBe('N');
            expect(events[1].value).toBe('b');

            object.value = 'c';

            expect(object.value).toBe('c');
            expect(events.length).toBe(3);
            expect(events[2].kind).toBe('N');
            expect(events[2].value).toBe('c');
        } finally {
            close();
        }
    });

    it('will not emit when the same value is reassigned to the observed property', () => {
        const object = { value: 'same' };

        const { events, close } = materializeStream(observeProperty(object, 'value'));

        try {
            expect(object.value).toBe('same');
            expect(events.length).toBe(1);
            expect(events[0].kind).toBe('N');
            expect(events[0].value).toBe('same');

            object.value = 'same';
            expect(object.value).toBe('same');
            expect(events.length).toBe(1);

            object.value = 'same';
            expect(object.value).toBe('same');
            expect(events.length).toBe(1);
        } finally {
            close();
        }
    });

    it('can observe a property that is defined through get and set accessor functions', () => {
        let objectValue = 'X';

        const object = {
            get value(): string { return objectValue; },
            set value(value: string) { objectValue = value; }
        };

        const { events, close } = materializeStream(observeProperty(object, 'value'));

        try {
            expect(object.value).toBe('X');
            expect(events.length).toBe(1);
            expect(events[0].kind).toBe('N');
            expect(events[0].value).toBe('X');

            object.value = 'Y';

            expect(object.value).toBe('Y');
            expect(objectValue).toBe('Y');
            expect(events.length).toBe(2);
            expect(events[1].kind).toBe('N');
            expect(events[1].value).toBe('Y');

            object.value = 'Z';

            expect(object.value).toBe('Z');
            expect(objectValue).toBe('Z');
            expect(events.length).toBe(3);
            expect(events[2].kind).toBe('N');
            expect(events[2].value).toBe('Z');
        } finally {
            close();
        }
    });

    it('can be used to observe properties defined through get and set accessor functions in a class hierachy', () => {
        class Foo {
            private myValue: number = 1;
            public get value(): number { return this.myValue; }
            public set value(value: number) { this.myValue = value; }
        }

        class Bar extends Foo {
            private myOtherValue: string = 'a';
            public get otherValue(): string { return this.myOtherValue; }
            public set otherValue(otherValue: string) { this.myOtherValue = otherValue; }
        }

        const object = new Bar();

        const { events: events1, close: close1 } = materializeStream(observeProperty(object, 'value'));
        const { events: events2, close: close2 } = materializeStream(observeProperty(object, 'otherValue'));

        try {
            expect(object.value).toBe(1);
            expect(events1.length).toBe(1);
            expect(events1[0].kind).toBe('N');
            expect(events1[0].value).toBe(1);
            expect(object.otherValue).toBe('a');
            expect(events2.length).toBe(1);
            expect(events2[0].kind).toBe('N');
            expect(events2[0].value).toBe('a');

            object.value = 42;

            expect(object.value).toBe(42);
            expect(events1.length).toBe(2);
            expect(events1[1].kind).toBe('N');
            expect(events1[1].value).toBe(42);
            expect(object.otherValue).toBe('a');
            expect(events2.length).toBe(1);

            object.otherValue = 'xyz';
            expect(object.value).toBe(42);
            expect(events1.length).toBe(2);
            expect(events2.length).toBe(2);
            expect(events2[1].kind).toBe('N');
            expect(events2[1].value).toBe('xyz');
        } finally {
            close1();
            close2();
        }
    });

    it('will return the same observable when observing the same object and property multiple times', () => {
        const object = { value: 'a' };

        const observable1 = observeProperty(object, 'value');
        const observable2 = observeProperty(object, 'value');
        const observable3 = observeProperty(object, 'value');

        expect(observable1 === observable2).toBe(true);
        expect(observable1 === observable3).toBe(true);
    });

    it('can be used to observe properties which have not yet been defined', () => {
        const object: { value?: string } = {};

        const { events, close } = materializeStream(observeProperty(object, 'value'));

        try {
            expect(object.value).toBeUndefined();
            expect(events.length).toBe(1);
            expect(events[0].kind).toBe('N');
            expect(events[0].value).toBe(undefined);

            object.value = 'pie!';

            expect(object.value).toBe('pie!');
            expect(events.length).toBe(2);
            expect(events[1].kind).toBe('N');
            expect(events[1].value).toBe('pie!');
        } finally {
            close();
        }
    });
});
