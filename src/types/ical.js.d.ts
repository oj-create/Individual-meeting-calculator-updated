declare module 'ical.js' {
    export class Component {
        constructor(jcal: any);
        getAllSubcomponents(name: string): Component[];
        getAllProperties(name: string): Property[];
    }

    export class Event {
        constructor(component: Component | any);
        summary: string;
        startDate: Time;
        endDate: Time;
        duration: Duration;
        uid: string;
        description: string;
        location: string;
    }

    export class Time {
        constructor(data: any);
        toJSDate(): Date;
    }

    export class Duration {
        constructor(data: any);
    }

    export class Property {
        getFirstValue(): string;
    }

    export function parse(input: string): any;
}
