package dk.rasmuserik;

import java.io.IOException;
import javax.servlet.http.*;

public class RasmusErikServlet extends HttpServlet {
	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {
		resp.setContentType("text/html");
		resp.getWriter().println("<html><head><title>rasmuserik.dk</title></head><body>blah</body></html>");
	}
}
