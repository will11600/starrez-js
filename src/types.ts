export interface EmailOutbox {
    EmailOutboxID: number;
    AddressTo: string;
    AddressCC: string;
    AddressBCC: string;
    FromAddress: string;
    FromName: string;
    SmtpUsername: string;
    SmtpPassword: string;
    Subject: string;
    Body: string;
    AttachmentPath: string;
    DateToSend: Date;
    Sent: boolean;
    SentAt: string;
    Failed: boolean;
    DateModified: Date;
}

export interface EntryCorrespondence {
    EntryID: number;
    From_EntryID: number;
    EntryCorrespondenceID: number;
    CorrespondenceSourceID: number;
    CorrespondenceDate: string;
    CorrespondenceName: string;
    Description: string;
    Comments: string;
    DocumentPath: string;
    FromEmail: string;
    SecurityUserID: number;
    CreatedBy_SecurityUserID: number;
    ViewOnWeb: boolean;
    ViewedDate: string;
    CorrespondenceStatusEnum: string;
    DateCreated: Date;
    DateModified: Date;
}