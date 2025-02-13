const express = require('express');
const bamboohr = require('@api/bamboohr');
const employee = require('./employee');
const Employements = require('./employments');
const app = express();
const port = 3000;
const token = 'f66a4295c9aaf8f81b687a180973fb44bef9eb5a';
bamboohr.auth(token);

createEmployee = (employeeData, employeeDetails) => {
    //name
    const name = employeeData.firstName + " " + employeeData.lastName;

    //tenure
    const hireDate = new Date(employeeDetails?.hireDate);
    const termintaionDate = employeeDetails?.terminationDate;
    const tenure = (termintaionDate != '0000-00-00') ? (new Date() - new Date(termintaionDate)) : (new Date() - hireDate) / (1000 * 60 * 60 * 24 * 365.25);

    //workAnninversary
    const date = hireDate.getDate() + 1;
    const month = hireDate.getMonth();
    const currentYear = new Date().getFullYear();
    const currentWorkAnniversary = new Date(currentYear, month, date);
    const nextWorkAnniversary = new Date(currentYear + 1, month, date);
    const workAnniversary = (currentWorkAnniversary > new Date()) ? currentWorkAnniversary : nextWorkAnniversary;

    const details = new employee(employeeData?.id, employeeData?.firstName, employeeData?.lastName,
        name, employeeData?.displayName, employeeDetails?.dateOfBirth, employeeData?.photoUrl, employeeData?.mobilePhone, employeeData?.workEmail, employeeData?.jobTitle, employeeData?.department, employeeDetails?.supervisorEId, employeeDetails?.hireDate, tenure.toPrecision(2), workAnniversary.toISOString().split("T")[0]);
    return details;
}

createEmployment = (employeeDetails, Employments, employmentData) => {
    const payCurrency = employeeDetails?.payRate.split(" ")[1];
    const employement = new Employements(employeeDetails?.id, employeeDetails?.id, employeeDetails?.jobTitle, employeeDetails?.payRate, employeeDetails?.payPeriod, employeeDetails?.payFrequency, payCurrency, employmentData?.jobInformationEffectiveDate, employeeDetails?.employmentHistoryStatus, employmentData?.compensationPayType, new Date(employeeDetails?.hireDate), employeeDetails?.lastChanged);
    Employments.push(employement);
    return Employments;
}

app.get('/getEmployees', async (req, res) => {
    try {
        const employeesDirectoryData = await bamboohr.getEmployeesDirectory({ companyDomain: 'newai' });
        const employees = employeesDirectoryData?.data?.employees;
        const result = [];
        for (let i = 0; i < employees.length; i++) {
            const employeeDetails = await bamboohr.getEmployee({
                fields: 'supervisorId%2CterminationDate%2CjobTitle%2CpayRate%2CpayPeriod%2CpayFrequency%2CeffectiveDate%2ClastChanged%2ChireDate%2CpayGroup%2CemploymentHistoryStatus%2CdateOfBirth',
                onlyCurrent: 'true',
                companyDomain: 'newai',
                id: employees[i]?.id
            });

            const effectiveDateData = await bamboohr.getDataFromDataset({
                filters: {
                    filters: [
                        {
                            field: 'employeeNumber',
                            operator: 'equal',
                            value: employees[i]?.id
                        }
                    ],
                    match: 'all'
                },
                fields: [
                    'jobInformationEffectiveDate',
                    'compensationPayType'
                ]
            }, {
                companyDomain: 'newai',
                datasetName: 'employee'
            });

            const Employments = [];
            result.push({ employee: createEmployee(employees[i], employeeDetails?.data), employments: createEmployment(employeeDetails?.data, Employments, effectiveDateData?.data?.data[0]) });
        }
        res.json(result);
    } catch (error) {
        console.log(error);
    }
});

app.listen(port, () => {
    console.log(`Application is running on the ${port}`);
});