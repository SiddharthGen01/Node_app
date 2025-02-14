const express = require('express');
const bamboohr = require('@api/bamboohr');
const employee = require('./employee');
const Employements = require('./employments');
const ListResponseDto = require('./list-response-dto');
const app = express();
const port = 3000;
const token = 'f66a4295c9aaf8f81b687a180973fb44bef9eb5a';
bamboohr.auth(token);
const fieldNames = ['supervisorId', 'terminationDate', 'jobTitle', 'payRate', 'payPeriod', 'payFrequency', 'effectiveDate', 'lastChanged', 'hireDate', 'payGroup', 'employmentHistoryStatus', 'dateOfBirth'];

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
        name, employeeData?.displayName, new Date(employeeDetails?.dateOfBirth), employeeData?.photoUrl, employeeData?.mobilePhone, employeeData?.workEmail, employeeData?.jobTitle, employeeData?.department, employeeDetails?.supervisorId, new Date(employeeDetails?.hireDate), tenure.toPrecision(2), workAnniversary);
    return details;
}

createEmployment = (employeeData, employeeDetails, employmentData) => {
   
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

    const payCurrency = employeeDetails?.payRate.split(" ")[1];
    const employement = new Employements(employeeDetails?.id, employeeDetails?.id, employeeDetails?.jobTitle, employeeDetails?.payRate, employeeDetails?.payPeriod, employeeDetails?.payFrequency, payCurrency, employmentData?.jobInformationEffectiveDate, employeeDetails?.employmentHistoryStatus, employeeDetails?.employmentHistoryStatus, new Date(employeeDetails?.hireDate), new Date(employeeDetails?.lastChanged));
    const Employments = [];
    Employments.push(employement);
    const employeeFields = new ListResponseDto(
        employeeData?.id, employeeData?.firstName, employeeData?.lastName, name, employeeData?.displayName, new Date(employeeDetails?.dateOfBirth), employeeData?.photoUrl, employeeData?.mobilePhone, employeeData?.workEmail, employeeData?.jobTitle, employeeData?.department, employeeDetails?.supervisorId, new Date(employeeDetails?.hireDate), tenure.toPrecision(2), workAnniversary, Employments);
    return employeeFields;
}

app.get('/list', async (req, res) => {
    try {
        const employeesDirectoryData = await bamboohr.getEmployeesDirectory({ companyDomain: 'newai' });
        const employees = employeesDirectoryData?.data?.employees;
        const result = [];
        for (let i = 0; i < employees.length; i++) {
            const employeeDetails = await bamboohr.getEmployee({
                fields: encodeURIComponent(fieldNames.join(',')),
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

            result.push(createEmployment(employees[i], employeeDetails?.data, effectiveDateData?.data?.data[0]));
        }
        res.json(result);
    } catch (error) {
        console.log(error);
    }
});

app.get('/get', async (req, res) => {
    try {
        const employeesDirectoryData = await bamboohr.getEmployeesDirectory({ companyDomain: 'newai' });
        const employees = employeesDirectoryData?.data?.employees;
        const result = [];
        for (let i = 0; i < employees.length; i++) {
            const employeeDetails = await bamboohr.getEmployee({
                fields: encodeURIComponent(fieldNames.join(',')),
                onlyCurrent: 'true',
                companyDomain: 'newai',
                id: employees[i]?.id
            });
            result.push(createEmployee(employees[i], employeeDetails?.data));
        }
        res.json(result);
    } catch (error) {
        console.log(error);
    }
});

app.listen(port, () => {
    console.log(`Application is running on the ${port}`);
});