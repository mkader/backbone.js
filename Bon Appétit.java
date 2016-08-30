import java.io.*;
import java.util.*;
import java.text.*;
import java.math.*;
import java.util.regex.*;

public class Solution {

    public static void main(String[] args) {
        /* Enter your code here. Read input from STDIN. Print output to STDOUT. Your class should be named Solution. */
        Scanner  s = new Scanner(System.in);
        int n = s.nextInt();
        int k= s.nextInt();
        long t = 0;
        long bi =0;
        for (int i=0;i<n;i++){
            if (k==i) bi = s.nextLong(); 
            else t+=s.nextLong();
        }
        long b = s.nextLong();
        long t2 =(t/2);
        if (t2==b)
            System.out.println("Bon Appetit");
        else
            System.out.println(b-t2);
    }
}