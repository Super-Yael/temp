package service;
import dao.UserDao;
import model.Page;
import model.User;

import java.sql.SQLException;
import java.util.List;

//public class UserService {
//
//    public int register(User user){
//        int i=1;
//
//        //如果用户名为admin，数据库已存在，注册失败
//        if (user.getUsername().equals("admin"))
//
//        {
//            i=0;
//        }
//        return i;
//    }

public class UserService{
     public int register(User user){
      UserDao userDao=new UserDao();
      return userDao.register(user);
    }

    public int addUser(User user){
        UserDao userDao=new UserDao();
        return userDao.addUser(user);
    }

    public User login(String username,String password) {
//        boolean flag=false;
        UserDao userDao = new UserDao();
        return userDao.getByusernamepassword(username, password);
//        if (user!=null)
//        {
//            flag=true;
//        }
//        return flag;
//    }
    }
    public List<User> getUsers() {
        UserDao userDao=new UserDao();//创建dao对象
        return userDao.getUsers();

    }

    public User selectById(int id) throws SQLException {
        UserDao userDao = new UserDao();
        return userDao.selectById(id);
    }

    public static void updateUserAddress(User user){
         try {
             UserDao.updateUserAddress(user);
         }catch (SQLException e){
             e.printStackTrace();
         }
    }

    public static void updateUserPassword(User user){
        try {
            UserDao.updateUserPassword(user);
        }catch (SQLException e){
            e.printStackTrace();
        }
    }
    public Page getUserPage(int pageNumber) {
        Page p = new Page();
        p.setPageNumber(pageNumber);
        int pageSize = 7;
        int totalCount = 0;
        try {
            totalCount = UserDao.selectUserCount();
        } catch (SQLException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        p.SetPageSizeAndTotalCount(pageSize, totalCount);
        List list=null;
        try {
            list = UserDao.selectUserList( pageNumber, pageSize);
        } catch (SQLException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        p.setList(list);
        return p;
    }
    public boolean delete(int id ) {
        try {
            UserDao.delete(id);
            return true;
        } catch (SQLException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
            return false;
        }
    }


}
