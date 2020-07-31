import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

import { MeetingService } from '@app/_services';

@Component({ templateUrl: 'list.component.html' })
export class ListComponent implements OnInit {
    meetings = null;

    constructor(private meetingService: MeetingService) {}

    ngOnInit() {
        this.meetingService.getAll()
            .pipe(first())
            .subscribe(meetings => { 
                meetings.sort(function(a, b){ 
                    return new Date(a.start).getTime() - new Date(b.start).getTime(); 
                }); 
                this.meetings = meetings;
            });
    }

    deleteMeeting(id: string) {
        const meeting = this.meetings.find(x => x.id === id);
        meeting.isDeleting = true;
        this.meetingService.delete(id)
            .pipe(first())
            .subscribe(() => {
                this.meetings = this.meetings.filter(x => x.id !== id);
            });
    }
}