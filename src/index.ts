import fastify, {FastifyReply, FastifyRequest} from "fastify";
import mongoose from "mongoose";
import Group from "./struct/Group.js";
import dotenv from "dotenv";
import https from "https";
import fetch from "node-fetch"

dotenv.config();

Date.prototype.getWeek = function() {
    let date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    let week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};

let inst = [495, 516, 490, 29, 538, 539, 540, 541]

class Main {
    server = fastify({ logger: true });

    groups:Group[] = [];

    async groupsParser(inst_id: number | string, kurs: number | string):Promise<string[]> {
        let now = new Date();
        let date = (now.getUTCFullYear() - (now.getUTCMonth() >= 6 ? 0 : 1)).toString();
    
        let url = `https://elkaf.kubstu.ru/timetable/default/time-table-student-ofo?iskiosk=0&fak_id=${inst_id}&kurs=${kurs}&ugod=${date}`;
    
        let res = await fetch(url, {
            headers: {
                "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36",
            },
            agent: new https.Agent({ rejectUnauthorized: false })
        });
    
        let text = await res.text();
    
        let matches = text.match(/<option.+<\/option>/g);
    
        if(!matches) return [];
    
        let groups:string[] = matches.slice( matches.indexOf("<option value=\"\">Выберите группу</option>")+1, matches.length )
            .map(elm => {
                let r = elm.substring(elm.indexOf(">")+1, elm.length);
                r = r.substring(0, r.indexOf("<"));
                return r;
            });
    
        return groups;
    }

    async getGroup(inst_id:number, group: string) {
        let year = +(group[0]+group[1])
            
        if(isNaN(year)) return;

        let now     = new Date();
        let kurs    = now.getUTCFullYear() - 2000 - (now.getUTCMonth() >= 6 ? 0 : 1) - year + 1;

        let groupClass = this.groups.find(g => g.name == group && g.instId == inst_id!)

        if(!groupClass) {
            let groups  = await this.groupsParser(inst_id, kurs);

            if(!groups?.includes(group)) return;

            groupClass = new Group(group, kurs, inst_id)

            this.groups.push(groupClass)
        } 
        
        return groupClass;
    }

    async start() {
        this.server.get<{ Querystring: IQuerystringGetShedule }>("/schedule", async (request, reply) => {
            if(!request.query.group || !request.query.inst_id) return {code: 400, message: "Группа и ID института обязательны!"}
            if(!inst.includes(+request.query.inst_id)) return {code: 400, message: "Институт не найден!"}
            
            let group:Group | undefined = await this.getGroup(+request.query.inst_id, request.query.group)

            if(!group) return {code: 400, message: "Группа не найдена!"}

            let date  = new Date();
            let day   = date.getDay()
            let week  = date.getWeek()%2==0

            if(request.query.day) {
                day = +request.query.day;
                if(day > 6) return {code: 400, message: "Допустимые значения для day: 0-6"}
            }

            if(request.query.week) {
                if(!["true", "false"].includes(request.query.week.toLocaleLowerCase())) return {code: 400, message: "Допустимые значения для week: true / false"}
                week = request.query.week.toLocaleLowerCase() == "true";
            }

            let schedule = await group.getRawSchedule(day, week);

            if(schedule == null) return { code: 503, message: "Сайт ВУЗа не отвечает. Расписания в базе не найдено" }

            return {code: 200, schedule};
        })

        this.server.post<{ Querystring: IQuerystringPostShedule }>("/schedule", async (request, reply) => {
            if(!request.query.group || !request.query.inst_id) return {code: 400, message: "Группа и ID института обязательны!"}
            if(!inst.includes(+request.query.inst_id)) return {code: 400, message: "Институт не найден!"}
            
            let group:Group | undefined = await this.getGroup(+request.query.inst_id, request.query.group)

            if(!group) return {code: 400, message: "Группа не найдена!"}

            let r = group.updateScheduleFromSite() // response

            if(r == null) return { code: 503, message: "Сайт ВУЗа не отвечает" }
            else return { code: 200 }
        })

        try {
            await this.server.listen({ port: 3000 })
        } catch (err) {
            this.server.log.error(err)
            process.exit(1)
        }
    }
}

mongoose.connect(process.env.MONGO_URI);
const main = new Main();
main.start();