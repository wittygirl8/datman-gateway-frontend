import React, { useEffect, useState } from "react";
import AddCard from "./AddCardCardStream";
import queryString from 'query-string';

function AddCardCs(props) {
    const [data, setData] = useState('')
    const [response, setResponse] = useState('')

    useEffect(() => {
        let url = window.location.href;
        const params = queryString.parseUrl(url);
        const { data, response } = params.query;

        setData(data);
        setResponse(response);
    }, []);

    return <AddCard
    data={data}
    base64Data ={response}
    />
}

export default AddCardCs;