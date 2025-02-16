const express = require("express");
const bamboohr = require("@api/bamboohr");
const employee = require("./employee");
const Employements = require("./employments");
const ListResponseDto = require("./list-response-dto");
const app = express();
const port = 3000;
const token = "f66a4295c9aaf8f81b687a180973fb44bef9eb5a";
bamboohr.auth(token);
const fieldNames = [
  "firstName",
  "lastName",
  "displayName",
  "workEmail",
  "profile",
  "supervisorId",
  "mobilePhone",
  "terminationDate",
  "jobTitle",
  "payRate",
  "payPeriod",
  "payFrequency",
  "effectiveDate",
  "lastChanged",
  "hireDate",
  "payGroup",
  "employmentHistoryStatus",
  "dateOfBirth",
];
let directoryData = [];

getEmployeesDirectoryData = async () => {
  try {
    const employeeDirectoryData = await bamboohr.getEmployeesDirectory({
      companyDomain: "newai",
    });
    directoryData = employeeDirectoryData?.data?.employees;
  } catch (error) {
    console.log(error);
  }
};

getEmployeesDirectoryData();

//Name:
const createName = (employeeData) => {
  return employeeData.firstName + " " + employeeData.lastName;
};

//Tenure:
const findTenure = (employeeDetails) => {
  const hireDate = new Date(employeeDetails?.hireDate);
  const termintaionDate = employeeDetails?.terminationDate;
  const tenure =
    termintaionDate != "0000-00-00"
      ? new Date() - new Date(termintaionDate)
      : (new Date() - hireDate) / (1000 * 60 * 60 * 24 * 365.25);
  return tenure;
};

//WorkAnninversary:
const findWorkAnninversary = (hireDate) => {
  const date = hireDate.getDate() + 1;
  const month = hireDate.getMonth();
  const currentYear = new Date().getFullYear();
  const currentWorkAnniversary = new Date(currentYear, month, date);
  const nextWorkAnniversary = new Date(currentYear + 1, month, date);
  const workAnniversary =
    currentWorkAnniversary > new Date()
      ? currentWorkAnniversary
      : nextWorkAnniversary;
  return workAnniversary;
};

const createEmployeeDetails = (
  id,
  avatarUrl,
  employeeDetails,
  effectiveDateData
) => {

  //Employement details:
  const payCurrency = employeeDetails?.data?.payRate.split(" ")[1];
  const employement = new Employements(
    undefined,
    employeeDetails?.data?.id,
    employeeDetails?.data?.jobTitle,
    employeeDetails?.data?.payRate,
    employeeDetails?.data?.payPeriod,
    employeeDetails?.data?.payFrequency,
    payCurrency,
    effectiveDateData?.data?.jobInformationEffectiveDate,
    employeeDetails?.data?.employmentHistoryStatus,
    employeeDetails?.data?.employmentHistoryStatus,
    new Date(employeeDetails?.data?.hireDate),
    new Date(employeeDetails?.data?.lastChanged)
  );
  const Employments = [];
  Employments.push(employement);

  return new ListResponseDto(
    id,
    employeeDetails?.data?.firstName,
    employeeDetails?.data?.lastName,
    createName(employeeDetails?.data),
    employeeDetails?.data?.displayName,
    new Date(employeeDetails?.data?.dateOfBirth),
    avatarUrl,
    employeeDetails?.data?.mobilePhone,
    employeeDetails?.data?.workEmail,
    employeeDetails?.data?.jobTitle,
    employeeDetails?.data?.department,
    employeeDetails?.data?.supervisorId,
    new Date(employeeDetails?.data?.hireDate),
    findTenure(employeeDetails?.data).toPrecision(2),
    findWorkAnninversary(new Date(employeeDetails?.data?.hireDate)),
    Employments
  );
};

app.get("/list", async (req, res) => {
  try {
    const employees = directoryData;
    const result = [];
    for (let i = 0; i < employees.length; i++) {
      const employeeDetails = await bamboohr.getEmployee({
        fields: encodeURIComponent(fieldNames.join(",")),
        onlyCurrent: "true",
        companyDomain: "newai",
        id: employees[i]?.id,
      });

      const effectiveDateData = await bamboohr.getDataFromDataset(
        {
          filters: {
            filters: [
              {
                field: "employeeNumber",
                operator: "equal",
                value: employees[i]?.id,
              },
            ],
            match: "all",
          },
          fields: ["jobInformationEffectiveDate"],
        },
        {
          companyDomain: "newai",
          datasetName: "employee",
        }
      );

      result.push(
        createEmployeeDetails(
          employees[i]?.id,
          employees[i]?.photoUrl,
          employeeDetails,
          effectiveDateData
        )
      );
    }
    res.json(result);
  } catch (error) {
    console.log(error);
  }
});

app.get("/get/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const employeeDetails = await bamboohr.getEmployee({
      fields: encodeURIComponent(fieldNames.join(",")),
      onlyCurrent: "true",
      companyDomain: "newai",
      id,
    });

    const effectiveDateData = await bamboohr.getDataFromDataset(
      {
        filters: {
          filters: [
            {
              field: "employeeNumber",
              operator: "equal",
              value: id,
            },
          ],
          match: "all",
        },
        fields: ["jobInformationEffectiveDate"],
      },
      {
        companyDomain: "newai",
        datasetName: "employee",
      }
    );

    const avatarUrl = directoryData.find((employee) => employee?.id === id)?.photoUrl || "";

    const employeeBody = createEmployeeDetails(
      id,
      avatarUrl,
      employeeDetails,
      effectiveDateData
    );

    res.json(employeeBody);
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Application is running on the ${port}`);
});
