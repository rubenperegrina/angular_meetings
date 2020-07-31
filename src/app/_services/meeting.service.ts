import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { Meeting } from '@app/_models';

@Injectable({ providedIn: 'root' })
export class MeetingService {
    private meetingSubject: BehaviorSubject<Meeting>;
    public meeting: Observable<Meeting>;

    constructor(
        private http: HttpClient
    ) {

        this.meetingSubject = new BehaviorSubject<Meeting>(JSON.parse(localStorage.getItem('meetings')));
        this.meeting = this.meetingSubject.asObservable();
    }

    public get meetingValue(): Meeting {
        return this.meetingSubject.value;
    }

    getAll() {
        return this.http.get<Meeting[]>(`${environment.apiUrl}/meetings`);
    }

    getById(id: string) {
        return this.http.get<Meeting>(`${environment.apiUrl}/meetings/${id}`);
    }

    create(meeting: Meeting) {
        return this.http.post(`${environment.apiUrl}/meetings/create`, meeting);
    }

    update(id, params) {
        return this.http.put(`${environment.apiUrl}/meetings/${id}`, params)
            .pipe(map(x => {
                if (id == this.meetingValue.id) {
                    const meeting = { ...this.meetingValue, ...params };
                    localStorage.setItem('meetings', JSON.stringify(meeting));

                    this.meetingSubject.next(meeting);
                }
                return x;
            }));
    }

    delete(id: string) {
        return this.http.delete(`${environment.apiUrl}/meetings/${id}`)
            .pipe(map(x => {
                return x;
            }));
    }
}