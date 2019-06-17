
export class hostingEnquiry {
    public discordId:string = "";
    public firstName:string="";
    public lastName:string="";
    public package:string="";
    public packageType: hostingType = hostingType.small;
}

export enum hostingType {
    small = 0,
    pro = 1,
    enterprise = 2
}