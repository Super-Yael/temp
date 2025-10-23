package util;

import com.mchange.v2.c3p0.ComboPooledDataSource;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

public class C3p0Util {
    public static DataSource ds;
    static {
        ds=new ComboPooledDataSource();//创建数据源，自动读取src下的配置文件c3po-config.xml,pro

    }
    public static Connection getConnection()throws SQLException{
        return ds.getConnection();
    }
}
