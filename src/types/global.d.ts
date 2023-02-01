import TelegramBot from "node-telegram-bot-api"

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            MONGO_URI: string;
            TOKEN: string;
        }
    }

    interface Date {
        getWeek(): number;
    }

    interface Lesson {
        number: number,
        time: string,
        name: string,
        paraType: string,
        teacher?: string,
        auditory?: string,
        remark?: string,
        percent?: string,
        flow?: booleanTelegramBot
    }

    interface Day {
        daynum: Number,
        even: Boolean,
        daySchedule: Lesson[]
    }
    
    interface Schedule {
        updateDate: Date,
        days: Day[]
    }

    interface IQuerystringGetShedule {
        inst_id?: string,
        group?: string,
        week?: string,
        day?: string,
    }

    interface IQuerystringPostShedule {
        inst_id?: string,
        group?: string
    }
}

export {};