package dao;

import model.User;
import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.handlers.BeanHandler;
import org.apache.commons.dbutils.handlers.BeanListHandler;
import org.apache.commons.dbutils.handlers.ScalarHandler;
import util.C3p0Util;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class UserDao {
    public User getByusernamepassword(String username, String password) {

        //1.根据连接池去创建窗口 dbutils
        QueryRunner runner = new QueryRunner(C3p0Util.ds);

        //2.定义sql和对应的参数数组
        String sql = "select  * from user where username=? and password=?";
        Object[] args = {username, password};
        //3.执行sql语句，返回结果
        User user = null;
        try {
            user = (User) runner.query(sql, new BeanHandler<>(User.class), args);
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }
        //多行多列数据 User.class
        //List<User> users=(List<User>)runner.query(sql,new BeanHandler<>(User.class),args);
        //多行单列 List
        //List<String> usernemes=(List<String>)runner.query(sql,new ColumnListHandler<>("username"),args)
        //单个  单行单列 第一行第一列
        //String username1=(String)runner.query(sql,new ScalarHandler<>(),args);
        //添加，修改、删除
        //int i=runner.update(sql,args);
        return user;
    }

    public List<User> getUsers() {

        //1.根据连接池去创建窗口 dbutils
        QueryRunner runner = new QueryRunner(C3p0Util.ds);

        //2.定义sql和对应的参数数组
        String sql = "select  * from user ";

        //3.执行sql语句，返回结果
        List<User> users = null;
        try {
            users = (List<User>) runner.query(sql, new BeanListHandler<>(User.class));
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }

        //List<User> users=(List<User>)runner.query(sql,new BeanHandler<>(User.class),args);

        return users;
    }

    public int register(User user) {
        int i = 0;
        QueryRunner runner = new QueryRunner(C3p0Util.ds);
        //定义sql和对应的参数数组
        String sql = "insert into user(username,email,password,name,phone,address)values(?,?,?,?,?,?)";
        Object[] args = {user.getUsername(), user.getEmail(), user.getPassword(), user.getName(), user.getPhone(), user.getAddress()};
        //执行SQL
        try {
            i = runner.update(sql, args);
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }
        return i;
    }

    public User selectByUsernamePassword(String username, String password) throws SQLException {
        QueryRunner runner = new QueryRunner(C3p0Util.ds);
        String sql = "select * from user where username=? and password=?";
        return runner.query(sql, new BeanHandler<User>(User.class), username, password);
    }

    public User selectByEmailPassword(String Email, String password) throws SQLException {
        QueryRunner runner = new QueryRunner(C3p0Util.ds);
        String sql = "select * from user where Email=? and password=?";
        return runner.query(sql, new BeanHandler<User>(User.class), Email, password);
    }

    public User selectById(int id) throws SQLException {
        QueryRunner runner = new QueryRunner(C3p0Util.ds);
        String sql = "select * from user where id=?";
        return runner.query(sql, new BeanHandler<User>(User.class), id);
    }

    public static void updateUserAddress(User user) throws SQLException {
        QueryRunner runner = new QueryRunner(C3p0Util.ds);
        String sql = "update user set name = ?,phone=?,address=? where id = ?";
        runner.update(sql, user.getName(), user.getPhone(), user.getAddress(), user.getId());
    }

    public static void updateUserPassword(User user) throws SQLException {
        QueryRunner runner = new QueryRunner(C3p0Util.ds);
        String sql = "update user set password = ? where id = ?";
        runner.update(sql, user.getPassword(), user.getId());
    }
    public int addUser(User user) {
        int i = 0;
        QueryRunner runner = new QueryRunner(C3p0Util.ds);
        //定义sql和对应的参数数组
        String sql = "insert into user(username,email,password,name,phone,address)values(?,?,?,?,?,?)";
        Object[] args = {user.getUsername(), user.getEmail(), user.getPassword(), user.getName(), user.getPhone(), user.getAddress()};
        //执行SQL
        try {
            i = runner.update(sql, args);
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }
        return i;
    }
    public static int selectUserCount() throws SQLException {
        QueryRunner r = new QueryRunner(C3p0Util.ds);
        String sql = "select count(*) from user";
        return r.query(sql, new ScalarHandler<Long>()).intValue();
    }
    public static List selectUserList(int pageNo, int pageSize) throws SQLException {
        QueryRunner r = new QueryRunner(C3p0Util.ds);
        String sql = "select * from user limit ?,?";
        return r.query(sql, new BeanListHandler<User>(User.class), (pageNo-1)*pageSize,pageSize );
    }
    public static void delete(int id) throws SQLException {
        QueryRunner r = new QueryRunner(C3p0Util.ds);
        String sql = "delete from user where id = ?";
        r.update(sql,id);
    }

    public List<User> findAll() {
        List<User> userList = new ArrayList<>();
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = C3p0Util.getConnection();
            String sql = "SELECT id, username, email, name, phone, address, isadmin, isvalidate " +
                    "FROM user ORDER BY id";
            ps = conn.prepareStatement(sql);
            rs = ps.executeQuery();

            while (rs.next()) {
                User user = new User();
                user.setId(rs.getInt("id"));
                user.setUsername(rs.getString("username"));
                user.setEmail(rs.getString("email"));
                user.setName(rs.getString("name"));
                user.setPhone(rs.getString("phone"));
                user.setAddress(rs.getString("address"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        return userList;
    }

    // 根据ID查询用户
    public User findById(int id) {
        // 实现省略
        return null;
    }

}