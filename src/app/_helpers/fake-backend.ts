import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';

let users = JSON.parse(localStorage.getItem('users')) || [];
let meetings = JSON.parse(localStorage.getItem('meetings')) || [];

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const { url, method, headers, body } = request;

        return of(null)
            .pipe(mergeMap(handleRoute))
            .pipe(materialize())
            .pipe(delay(500))
            .pipe(dematerialize());

        function handleRoute() {
            switch (true) {
                //Users

                case url.endsWith('/users/authenticate') && method === 'POST':
                    return authenticate();
                case url.endsWith('/users/register') && method === 'POST':
                    return register();
                case url.endsWith('/users') && method === 'GET':
                    return getUsers();
                case url.match(/\/users\/\d+$/) && method === 'GET':
                    return getUserById();
                case url.match(/\/users\/\d+$/) && method === 'PUT':
                    return updateUser();
                case url.match(/\/users\/\d+$/) && method === 'DELETE':
                    return deleteUser();

                //Meetings
                
                case url.endsWith('/meetings') && method === 'GET':
                    return getMeetings();
                case url.match(/\/meetings\/\d+$/) && method === 'GET':
                    return getMeetingById();
                case url.endsWith('/meetings/create') && method === 'POST':
                    return createMeeting();
                case url.match(/\/meetings\/\d+$/) && method === 'DELETE':
                    return deleteMeeting();
                case url.match(/\/meetings\/\d+$/) && method === 'PUT':
                    return updateMeeting();

                default:
                    return next.handle(request);
            }    
        }

        //Users

        function authenticate() {
            const { userName, password } = body;
            const user = users.find(x => x.userName === userName && x.password === password);
            if (!user) return error('Username or password is incorrect');
            return ok({
                id: user.id,
                userName: user.userName,
                firstName: user.firstName,
                lastName: user.lastName,
                meetings: user.meetings,
                token: 'fake-jwt-token'
            })
        }

        function register() {
            const user = body

            if (users.find(x => x.userName === user.userName)) {
                return error('userName "' + user.userName + '" is already taken')
            }

            user.id = users.length ? Math.max(...users.map(x => x.id)) + 1 : 1;
            users.push(user);
            localStorage.setItem('users', JSON.stringify(users));
            return ok();
        }

        function getUsers() {
            if (!isLoggedIn()) return unauthorized();
            return ok(users);
        }

        function getUserById() {
            if (!isLoggedIn()) return unauthorized();

            const user = users.find(x => x.id === idFromUrl());
            return ok(user);
        }

        function updateUser() {
            if (!isLoggedIn()) return unauthorized();

            let params = body;
            let user = users.find(x => x.id === idFromUrl());

            if (!params.password) {
                delete params.password;
            }
            Object.assign(user, params);
            localStorage.setItem('users', JSON.stringify(users));

            return ok();
        }

        function deleteUser() {
            if (!isLoggedIn()) return unauthorized();

            users = users.filter(x => x.id !== idFromUrl());
            localStorage.setItem('users', JSON.stringify(users));
            return ok();
        }

        //Meetings

        function createMeeting() {
            const meeting = body

            if (meetings.find(x => x.name === meeting.name)) {
                return error('Name "' + meeting.name + '" is already taken')
            }

            meeting.id = meetings.length ? Math.max(...meetings.map(x => x.id)) + 1 : 1;
            meetings.push(meeting);
            localStorage.setItem('meetings', JSON.stringify(meetings));
            return ok();
        }

        function getMeetings() {
            if (!isLoggedIn()) return unauthorized();
            return ok(meetings);
        }

        function getMeetingById() {
            if (!isLoggedIn()) return unauthorized();

            const meeting = meetings.find(x => x.id === idFromUrl());
            return ok(meeting);
        }

        function updateMeeting() {
            if (!isLoggedIn()) return unauthorized();

            let params = body;
            let meeting = meetings.find(x => x.id === idFromUrl());

            Object.assign(meeting, params);
            localStorage.setItem('meetings', JSON.stringify(meetings));

            return ok();
        }

        function deleteMeeting() {
            if (!isLoggedIn()) return unauthorized();

            meetings = meetings.filter(x => x.id !== idFromUrl());
            localStorage.setItem('meetings', JSON.stringify(meetings));
            return ok();
        }

        // Helpers

        function ok(body?) {
            return of(new HttpResponse({ status: 200, body }))
        }

        function error(message) {
            return throwError({ error: { message } });
        }

        function unauthorized() {
            return throwError({ status: 401, error: { message: 'Unauthorised' } });
        }

        function isLoggedIn() {
            return headers.get('Authorization') === 'Bearer fake-jwt-token';
        }

        function idFromUrl() {
            const urlParts = url.split('/');
            return parseInt(urlParts[urlParts.length - 1]);
        }
    }
}

export const fakeBackendProvider = {
    provide: HTTP_INTERCEPTORS,
    useClass: FakeBackendInterceptor,
    multi: true
};