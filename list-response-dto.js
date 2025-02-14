class ListResponseDto {
    constructor(id, firstName, lastName, name, displayName, dateOfBirth, avatarUrl, personalPhoneNumber,
        workEmail, jobTitle, department, managerId, startDate, tenure, workAnniversary, employements
    ) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.name = name;
        this.displayName = displayName;
        this.dateOfBirth = dateOfBirth;
        this.avatarUrl = avatarUrl;
        this.personalPhoneNumber = personalPhoneNumber;
        this.workEmail = workEmail;
        this.jobTitle = jobTitle;
        this.department = department;
        this.managerId = managerId;
        this.startDate = startDate;
        this.tenure = tenure;
        this.workAnniversary = workAnniversary;
        this.employements = employements;
    }
}

module.exports = ListResponseDto;