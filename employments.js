class Employements {
    constructor(id, employeeId, jobTitle, payRate, payPeriod, payFrequency, payCurrency, effectiveDate, employmentType, employmentContractType, createdAt, updatedAt){
        this.id = id;
        this.employeeId = employeeId;
        this.jobTitle = jobTitle;
        this.payRate = payRate;
        this.payPeriod = payPeriod;
        this.payFrequency = payFrequency;
        this.payCurrency = payCurrency;
        this.effectiveDate = effectiveDate;
        this.employmentType = employmentType;
        this.employmentContractType = employmentContractType;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

module.exports = Employements;