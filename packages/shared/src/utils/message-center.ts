import type { Subscription } from 'rxjs';
import { Subject } from 'rxjs';

export class MessageCenter {
  private _subjects = new Map<string, Subject<any>>();

  emit<T>(event: string, data?: T) {
    const subject = this._subjects.get(event);
    if (subject) {
      subject.next(data);
    }
  }

  addListener<T>(event: string, listener: (data?: T) => void): Subscription {
    let subject = this._subjects.get(event);
    if (!subject) {
      subject = new Subject<T>();
      this._subjects.set(event, subject);
    }
    return subject.subscribe(listener);
  }

  clear() {
    this._subjects.forEach(subject => subject.complete());
    this._subjects.clear();
  }
}
