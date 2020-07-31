import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { MeetingService, AlertService, AccountService } from '@app/_services';

@Component({ templateUrl: 'add-edit.component.html' })
export class AddEditComponent implements OnInit {
    form: FormGroup;
    id: string;
    isAddMode: boolean;
    loading = false;
    submitted = false;
    startDate = '09:00';
    endDate = '18:00';
    users = null;
    selectStart = false;
    selectEnd = false;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private meetingService: MeetingService,
        private alertService: AlertService,
        private accountService: AccountService,
    ) {}

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        this.isAddMode = !this.id;

        this.accountService.getAll()
        .pipe(first())
        .subscribe(users => this.users = users);
        
        const passwordValidators = [Validators.minLength(6)];
        if (this.isAddMode) {
            passwordValidators.push(Validators.required);
        }

        this.form = this.formBuilder.group({
            name: ['', Validators.required],
            start: ['', Validators.required],
            end: ['', Validators.required],
            participants: ['', Validators.required]
        });

        if (!this.isAddMode) {
            this.meetingService.getById(this.id)
                .pipe(first())
                .subscribe(x => {
                    this.f.name.setValue(x.name);
                    this.f.start.setValue(x.start);
                    this.f.end.setValue(x.end);
                    this.f.participants.setValue(x.participants);
                });
        }
    }
    get f() { return this.form.controls; }

    onCheck() {
        let start = this.form.value.start;
        let end = this.form.value.end;
        let formStart =  new Date(start);
        let day = formStart.getFullYear() + '-' + ("0" + (formStart.getMonth() + 1)).slice(-2) + '-' + formStart.getDate();
        let startTime = day + 'T' + this.startDate;
        let endTime = day + 'T' + this.endDate;
 
        if(start < startTime || end > endTime) {
            this.submitted = true;
            this.selectStart = true;
            this.selectEnd = true;
            document.getElementById("end").setAttribute("disabled", 'true');
        } else {
            this.selectEnd = false;
            this.selectStart = false;
            document.getElementById("end").removeAttribute("disabled");
            document.getElementById("end").setAttribute("min", start);
            document.getElementById("end").setAttribute("max",  endTime);
        }
    }

    onSubmit() {
        this.submitted = true;

        this.alertService.clear();

        if (this.form.invalid) {
            return;
        }

        this.loading = true;
        if (this.isAddMode) {
            this.createMeeting();
        } else {
            this.updateMeeting();
        }
    }

    private createMeeting() {
        this.meetingService.create(this.form.value)
            .pipe(first())
            .subscribe(
                data => {
                    this.alertService.success('Meeting added successfully', { keepAfterRouteChange: true });
                    this.router.navigate(['.', { relativeTo: this.route }]);
                },
                error => {
                    this.alertService.error(error);
                    this.loading = false;
                });
    }

    private updateMeeting() {
        this.meetingService.update(this.id, this.form.value)
            .pipe(first())
            .subscribe(
                data => {
                    this.alertService.success('Update successful', { keepAfterRouteChange: true });
                    this.router.navigate(['..', { relativeTo: this.route }]);
                },
                error => {
                    this.alertService.error(error);
                    this.loading = false;
                });
    }
}