import moment from "moment";

export const findWeeklyShift = (date: Date) => {
    const firstDayOfWeek = moment.utc(date).add(1, "days").day('Monday').format('YYYY-MM-DD')
    const lastDayOfWeek = moment.utc(firstDayOfWeek).add(6, 'days').format('YYYY-MM-DD')

    return [firstDayOfWeek , lastDayOfWeek]
}