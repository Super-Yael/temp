package common;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;

@WebFilter("/*")
public class Filter1 implements Filter {
    public void init(FilterConfig config) throws ServletException {
    }

    public void destroy() {
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws ServletException, IOException {
        HttpServletRequest rqt=(HttpServletRequest) request;
        HttpServletResponse rps=(HttpServletResponse) response;
        String url=rqt.getRequestURI().toString();
        if (url.contains("register.jsp")|| url.contains("/Register")
                || url.contains("/css") || url.contains("/js") || url.contains("/img")
                || url.contains("/login.jsp") || url.contains("/Login") ||url.contains("/queryTypes"))

        {
            chain.doFilter(request,response);
        }
        else {
                HttpSession session=  rqt.getSession();
                if (session.getAttribute("username")!=null){
                    chain.doFilter(request,response);
                }
                else{

//                    response.getWriter().println(rqt.getContextPath());
                    rps.sendRedirect(rqt.getContextPath()+"/login.jsp");
                }
        }
    }
}
