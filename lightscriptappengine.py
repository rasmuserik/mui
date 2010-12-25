import os
import cgi
import cgitb
cgitb.enable()

def parsexml(xmltext):
    stack = [[]]
    import xml.parsers.expat
    def start_element(name, attrs):
        stack.append([name, attrs])
    def end_element(name):
        stack[-2].append(stack[-1])
        stack.pop()
    def char_data(data):
        data = data.strip()
        if data != u"":
            stack[-1].append(data)

    p = xml.parsers.expat.ParserCreate()
    p.StartElementHandler = start_element
    p.EndElementHandler = end_element
    p.CharacterDataHandler = char_data

    p.Parse(xmltext, True)
    return stack[0][0]

def httpget(url, params):
    import urllib
    params = urllib.urlencode(params)
    url = url + "?" + params
    return urllib.urlopen(url).read()

def lightscriptrequest():
    form = cgi.FieldStorage()
    params = {}
    for key in form:
        params[key] = form.getvalue(key)
    return {"user-agent": os.environ["HTTP_USER_AGENT"],
            "referer": os.environ.get("HTTP_REFERER", None),
            "path": os.environ["PATH_INFO"],
            "http-accept": os.environ["HTTP_ACCEPT"],
            "params": params}
