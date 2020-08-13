export const api = process.env.NODE_ENV === "development"
    ? 'http://127.0.0.1:8000/api/v0'
    : 'https://spiltcoffee.herokuapp.com/api/v0'

export const url = process.env.NODE_ENV === "development"
    ? 'http://localhost:3000'
    : 'https://spilt-coffee.web.app'