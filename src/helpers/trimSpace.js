export const trimData = (data) => {
    // initial check if values exist or not
    if (data?.avs?.house_number && data?.avs?.postcode) {
        console.log(trimWhiteSpace(data.avs.house_number), trimWhiteSpace(data.avs.postcode));
        return trimWhiteSpace(data.avs.house_number) || trimWhiteSpace(data.avs.postcode);
    }
    return trimWhiteSpace(data);
}

export const trimWhiteSpace = (string) => {
    // Regex to identify whitespace at the starting of string and replace it with '' //`${string.toString().replace(/^\s+/g, '')}`
    return string? `${string.toString().replace(/(^\s+)|(\s+$)/g, '')}` : '';
} 