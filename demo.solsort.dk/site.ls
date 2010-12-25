request(req) = {
    print("Content-Type: text/html; charset=UTF-8\n");
    print('<html><body><a href="/site">afeava</a><pre>');
    print(req);
    print(parsexml(httpget("http://solsort.dk/", {})));
}
