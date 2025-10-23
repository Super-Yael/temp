package other;

import com.mchange.v2.c3p0.ComboPooledDataSource;

import javax.sql.DataSource;
import java.sql.SQLException;

public class C3demo2 {
    public static DataSource ds;
    static {
        ds=new ComboPooledDataSource();//创建数据源，自动读取src下的配置文件c3po-config.xml,pro

    }

    public static void main(String[] args) throws SQLException {
        System.out.println(ds.getConnection());
    }
}
