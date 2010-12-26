filter(fn, list) = {
    filterfn(elem, acc) = {
        if (fn(elem)) {
            array_push(acc, elem);
        };
        return acc;
    };
    return fold(filterfn, list, []);
};
first = (x) -> x[0];
puts(x) = {
    print(x);
};
putandreturn(obj, key, value) = {
    obj[key] = value;
    return obj;
};
findtag(tagname, xml) = {
    return first(filter((x) -> x[0] == tagname, tail(xml, 2)));
};
biblookup(query, firstRecord) = {
    query = query || "dc.creator = (jensen) and dc.title = (klit)";
    firstRecord = firstRecord || 1;
    response = parsexml(httpget("http://webservice.bibliotek.dk/soeg", {
        "version": "1.1",
        "operation": "searchRetrieve",
        "query": query,
        "maximumRecords": 10,
        "startRecord": firstRecord,
        "recordSchema": "dc"
    }));
    var numrecs = findtag("numberOfRecords", response)[2];
    records = tail(findtag("records", response), 2);
    // Find the subtag in the records which has the actual data
    records = map((a) -> tail(findtag("dc:dc", findtag("recordData", a)), 2), records);
    // Transform the records into tables for easier access
    handleEntry(elem, acc) = {
        str = array_join(tail(elem, 2), "");
        if (str != "") {
            entry = get(acc, elem[0], []);
            array_push(entry, str);
            acc[elem[0]] = entry;
        };
        return acc;
    };
    records = map((record) -> fold(handleEntry, record, {}), records);
    return {
        "firstRecord": firstRecord,
        "lastRecord": firstRecord + len(records) - 1,
        "totalHits": numrecs,
        "records": records
    };
};
request(req) = {
    print("Content-Type: text/html; charset=UTF-8\n");
    print("<html><body>");
    print(req);
    print(biblookup());
};
