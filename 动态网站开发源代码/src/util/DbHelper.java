package util;

import java.sql.*;

public class DbHelper {
	
	static String url="jdbc:mysql://localhost:3306/shop?serverTimezone=Asia/Shanghai";//serverTimezone=UTC统一时区，比中国早8小时
	static  String user="root"; //登录数据库的账号
	static  String pwd="root";
	static  Connection conn;//连接对象
	static Statement statement;//查询窗口
	static PreparedStatement pStatement;//预编译查询窗口
	static  ResultSet rs;//数据集对象
	public static void getconnetion()  {//创建打开连接
		try {
			Class.forName("com.mysql.cj.jdbc.Driver");
			 //登录数据库的密码
			 conn=DriverManager.getConnection(url, user, pwd);
			 System.out.println("数据库连接成功！");

		} catch (Exception e) {
			// TODO 自动生成的 catch 块
			e.printStackTrace();
		}
		
	}
	
	public static int excuteUpdate(String sql) {//添加、修改、删除
		
		
		int i=0;
		try {
			statement = conn.createStatement();//创建普通窗口
			i=statement.executeUpdate(sql);//执行sql语句
			
		} catch (SQLException e) {
			// TODO 自动生成的 catch 块
			e.printStackTrace();
		}
		return i;

	}
public static int excuteUpdate(String sql,Object[] args) {//添加、修改、删除
		
		
		int i=0;
		try {
			
			pStatement=conn.prepareStatement(sql);//创建预编译窗口
			if (args!=null && args.length>0) {
				for (int j = 0; j < args.length; j++) {
					pStatement.setObject(j+1, args[j]);					
				}
				
			}
			i=pStatement.executeUpdate();
			
		} catch (SQLException e) {
			// TODO 自动生成的 catch 块
			e.printStackTrace();
		}
		return i;

	}
	
public static ResultSet excuteQuery(String sql,Object[] args) {//查询
		
		
	
		try {
			pStatement=conn.prepareStatement(sql);
			if (args!=null && args.length>0) {
				for (int j = 0; j < args.length; j++) {
					pStatement.setObject(j+1, args[j]);					
				}
				
			}
			rs=pStatement.executeQuery();
			
		} catch (SQLException e) {
			// TODO 自动生成的 catch 块
			e.printStackTrace();
		}
		return rs;

	}

public static ResultSet excuteQuery(String sql) {//查询
	
	
	
	try {
		statement = conn.createStatement();
		rs=statement.executeQuery(sql);
		
	} catch (SQLException e) {
		// TODO 自动生成的 catch 块
		e.printStackTrace();
	}
	return rs;

}


public static void close()  {//关闭连接
	if (rs!=null) {
		try {
			rs.close();
		} catch (SQLException e) {
			// TODO 自动生成的 catch 块
			e.printStackTrace();
		}
	}
	if (pStatement!=null) {
		try {
			pStatement.close();
		} catch (SQLException e) {
			// TODO 自动生成的 catch 块
			e.printStackTrace();
		}
	}
	if (statement!=null) {
		try {
			statement.close();
		} catch (SQLException e) {
			// TODO 自动生成的 catch 块
			e.printStackTrace();
		}
	}
	if (conn!=null) {
		try {
			conn.close();
		} catch (SQLException e) {
			// TODO 自动生成的 catch 块
			e.printStackTrace();
		}
	}
}

}
