export class HostingEnquiry {
    public discordId:string = "";
    public firstName:string="";
    public lastName:string="";
    public package:string="";
    public packageType: HostingType = HostingType.Small;
}

export enum HostingType {
    Small = 0,
    Pro = 1,
    Enterprise = 2
}