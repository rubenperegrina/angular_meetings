import { User } from './user';

export class Meeting {
    name: String;
    id: String;
    start: Date;
    end: Date;
    participants: User;
}