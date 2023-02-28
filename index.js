const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

async function scrapeTable(url, date) {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const table = $('table').first();
        const rows = table.find("tbody tr");
        const data = [];

        rows.each((_, element) => {
            const columns = $(element).find("td");
            const rowData = [];

            const stateAbbreviation = $(element)
                .find("th[scope=row]")
                .text()
                .trim();

            rowData.push(date.month);
            rowData.push(date.year);
            stateAbbreviation !== "" && rowData.push(stateAbbreviation);

            columns.each((_, element) => {
                rowData.push($(element).text().trim().replace(/,/g, ''));
            });

            data.push(rowData);
        });

        const header = [
            "Month",
            "Year",
            "State",
            "County",
            "Number of children"
        ];

        data.unshift(header);
        const csv = data.map((row) => row.join(",")).join("\n");
        fs.writeFileSync(`data/${date.month}-${date.year}.csv`, csv);
        console.log("Table scraped and saved to table.csv");
    } catch (error) {
        console.error(error);
    }
}

const startDate = new Date("September 1, 2019");
const endDate = new Date("December 31, 2022");
let currentDate = new Date(startDate);

while (currentDate <= endDate) {
    const month = currentDate.toLocaleString("default", { month: "long" });
    const year = currentDate.getFullYear();
    const formattedDate = `${month.toLowerCase()}-${year}`;

    scrapeTable(
        `https://www.hhs.gov/programs/social-services/unaccompanied-children-released-to-sponsors-by-county-${formattedDate}.html`,
        { month, year }
    );

    currentDate.setMonth(currentDate.getMonth() + 1);
}
