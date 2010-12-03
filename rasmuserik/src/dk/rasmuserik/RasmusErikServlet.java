package dk.rasmuserik;

import java.io.IOException;
import java.lang.*;
import java.util.*;
import javax.servlet.http.*;

public class RasmusErikServlet extends HttpServlet {
        public void doGet(HttpServletRequest req, HttpServletResponse res)
                        throws IOException {
                res.setContentType("text/html");
                java.io.PrintWriter w = res.getWriter();
                w.println("<html><body><a href=\"foo\">foo</a><pre>");
                w.println("AuthType: " + String.valueOf(req.getAuthType()));
                w.println("ContextPath: " + String.valueOf(req.getContextPath()));
                w.println("Method: " + String.valueOf(req.getMethod()));
                w.println("PathInfo: " + String.valueOf(req.getPathInfo()));
                w.println("PathTranslated: " + String.valueOf(req.getPathTranslated()));
                w.println("QueryString: " + String.valueOf(req.getQueryString()));
                w.println("RemoteUser: " + String.valueOf(req.getRemoteUser()));
                w.println("RequestedSessionId: " + String.valueOf(req.getRequestedSessionId()));
                w.println("RequestURI: " + String.valueOf(req.getRequestURI()));
                w.println("ServletPath: " + String.valueOf(req.getServletPath()));
                w.println("RemoteHost: " + String.valueOf(req.getRemoteHost()));
                w.println("RemoteAddr: " + String.valueOf(req.getRemoteAddr()));
                w.println("ContentType: " + String.valueOf(req.getContentType()));
                w.println("CharacterEncoding: " + String.valueOf(req.getCharacterEncoding()));
                w.println("Scheme: " + String.valueOf(req.getScheme()));
                w.println("headers:");
                for (Enumeration e = req.getHeaderNames(); e.hasMoreElements() ;) {
                    String s = String.valueOf(e.nextElement());
                    w.println(s);
                    for (Enumeration e2 = req.getHeaders(s); e2.hasMoreElements() ;) {
                        w.println("    " + e2.nextElement());
                    }
                }
                w.println("Attributes:"); for (Enumeration e = req.getAttributeNames(); e.hasMoreElements() ;) { String s = String.valueOf(e.nextElement()); w.println(s+ ": " + String.valueOf(req.getAttribute(s))); }
                w.println("Parameters:"); for (Enumeration e = req.getParameterNames(); e.hasMoreElements() ;) { String s = String.valueOf(e.nextElement()); w.println(s+ ": " + String.valueOf(req.getParameter(s))); }
                w.println("Locales:"); for (Enumeration e = req.getLocales(); e.hasMoreElements() ;) { String s = String.valueOf(e.nextElement()); w.println(s); }
                w.println("</pre></body></html>");
        }
}
